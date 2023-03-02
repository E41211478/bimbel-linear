import Link from "next/link";
const notfound = () => {
    return (
        // next link
        <div>
            <h1>
                not found user
            </h1>

            <Link href="/">
                <h1>Go back home</h1>
            </Link>
        </div>
    )
}

export default notfound