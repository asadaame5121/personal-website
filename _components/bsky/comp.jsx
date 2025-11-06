export default function BskyPost({posts}) {
    return (
        <div>
            <h2>BskyPost</h2>
            <ul>
                {posts.map((post) => (
                    <li key={post.uri}>{post.text}</li>
                ))}
            </ul>
        </div>
    );
}
    