import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";
import Link from "next/link";
import hljs from "highlight.js";
import Header from "@/components/Header";
import { sortByDate } from "@/utils";

// marked.setOptions({
//   highlight: function (code, lang, callback) {
//     require("pygmentize-bundled")(
//       { lang: lang, format: "html" },
//       code,
//       function (err, result) {
//         callback(err, result.toString());
//       }
//     );
//   },
// });

marked.setOptions({
  langPrefix: "hljs language-",
  highlight: function (code) {
    return hljs.highlightAuto(code, [
      "html",
      "javascript",
      "php",
      "bash",
      "python",
      "shell",
    ]).value;
    // return hljs.highlightAll(code);
  },
});

export default function PostPage({
  frontmatter: {
    title,
    tag,
    date,
    cover_image,
    author_name,
    author_title,
    author_image,
  },
  slug,
  content,
  posts,
}) {
  return (
    <>
      <Header frontmatter={posts} />

      <div className="container mx-10 px-10 mt-5">
        <div className="md:w-6/12 w-full mx-auto flex items-center flex-col">
          <div className="flex items-center text-black/60 space-x-4">
            <div className="uppercase">{tag}</div>
            <span>•</span>
            <div>{date}</div>
          </div>
          <h2 className="text-2xl mt-4 text-center">
            <a href="/detail">{title}</a>
          </h2>
          <div className="flex items-center mt-5">
            <img
              src={author_image}
              className="w-14 h-14 rounded-full object-cover"
            />
            <div className="ml-4">
              <h3>{author_name}</h3>
              <div className="text-black/60 text-sm mt-1">{author_title}</div>
            </div>
          </div>
        </div>
        <div className="md:w-10/12 w-full mx-auto my-10">
          <img src={cover_image} className="w-full rounded-lg" />
        </div>
        <div className="w-full mx-auto mb-5 prose prose-zinc prose-table:table-auto prose-th:bg-gray-700 prose-th:text-white prose-th:font-sans prose-th:p-4 prose-table:border prose-td:p-4 prose-tr:bg-gray-900 prose-tr:text-white max-w-3xl prose-blockquote:border-yellow-400 prose-blockquote:bg-gray-100 prose-blockquote:px-5 prose-blockquote:py-2 prose-blockquote:rounded">
          <div dangerouslySetInnerHTML={{ __html: marked(content) }}></div>
        </div>
      </div>
    </>
  );
}

export async function getStaticPaths() {
  const files = fs.readdirSync(path.join("posts"));

  const paths = files.map((filename) => ({
    params: { slug: filename.replace(".md", "") },
  }));

  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps({ params: { slug } }) {
  const markdownWithMeta = fs.readFileSync(
    path.join("posts", slug + ".md"),
    "utf-8"
  );

  const { data: frontmatter, content } = matter(markdownWithMeta);

  const files = fs.readdirSync(path.join("posts"));

  const posts = files.map((filename) => {
    const slug = filename.replace(".md", "");

    const allMarkdownWithMeta = fs.readFileSync(
      path.join("posts", filename),
      "utf-8"
    );

    const { data: frontmatter } = matter(allMarkdownWithMeta);

    return {
      slug,
      frontmatter,
    };
  });

  return {
    props: {
      frontmatter,
      slug,
      content,
      posts: posts.sort(sortByDate),
    },
  };
}
