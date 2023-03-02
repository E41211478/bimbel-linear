import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "y/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const exampleRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.example.findMany();
  }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
  getSecretMessageApi: publicProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/secret",
        tags: ["secret"],
        summary: "Get secret message",
      },
    })
    .input(z.void())
    .output(z.string())
    .query(() => {
      return "you can now see this secret message!";
    }),
  helloApi: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),
  getAllApi: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.example.findMany();
  }),
  getAllAPI: publicProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/all",
        tags: ["all"],
        summary: "Get all",
      },
    })
    .input(z.void())
    .output(
      z.object({
        // buat status code dan message
        status: z.number(),
        message: z.string(),
        // buat data
        data: z.array(
          z.object({
            id: z.string(),
            createdAt: z.date(),
            updatedAt: z.date(),
          })
        ),
      })
    )
    .query(async ({ ctx }) => {
      const result = await ctx.prisma.example.findMany();
      return {
        status: 200,
        message: "success",
        data: result,
      };
    }),
  pushExampleAPI: publicProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/push",
        tags: ["push"],
        summary: "Push example",
      },
    })
    // buat input zod id string dan void untuk
    .input(z.object({ id: z.string() }))
    .output(
      z.object({
        // buat status code dan message
        message: z.string(),
        code: z.string(),
        // buat data
        data: z.object({
          id: z
            .string()
            .min(3, { message: "Must be 5 or more characters of length!" })
            .max(5, {
              message: "Must not be more than 200 characters of length!",
            })
            .trim(),
        }),
      })
    )
    // masukkan data ke dalam database
    .mutation(async ({ ctx, input }) => {
      const { id } = input;
      // lakukan pengecekan apakah id sudah ada di database atau belum
      const check = await ctx.prisma.example.findUnique({
        where: {
          id,
        },
      });
      // jika sudah ada maka akan mengembalikan error
      if (check) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "id already exist",
        });
        // tambahkan status code
        // const statusCode = getHTTPStatusCodeFromError(error);
        // return res.status(statusCode).json({
        //   message: error.message,
        // });
      }
      // jika id kurang dari 3 maka akan mengembalikan error
      if (id.length < 3) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "id must be 3 or more characters of length",
        });
      }
      // jika id lebih dari 5 maka akan mengembalikan error
      if (id.length > 5) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "id must not be more than 5 characters of length",
        });
      }
      // jika id tidak ada di database maka akan di push ke database
      const result = await ctx.prisma.example.create({
        data: {
          id,
        },
      });
      return {
        code: "OK",
        message: "success",
        data: result,
      };
    }),
});
