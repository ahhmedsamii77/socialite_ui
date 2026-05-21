import Suggestions from "@/components/Home/Suggestions"
import CreatePost from "@/components/Post/CreatePost"
import PostList from "@/components/Post/PostList"
import { Helmet } from "react-helmet"
export default function Home() {
  return (
    <>
      <Helmet>
        <title>Socialite — Connect & Share</title>
      </Helmet>
      <section className="flex gap-6 py-6 lg:px-4">
        <div className="space-y-4 mx-auto flex-1">
          <CreatePost />
          <PostList />
        </div>
        <div className="w-75 hidden lg:block">
          <Suggestions />
        </div>
      </section>
    </>
  )
}
