import React from 'react'
import { Post } from './post'

interface Posts {
  posts: {
    title: string
    text: string
    category: string
  }[]
}

export function RecommendedPosts({ posts }: Posts) {
  return (
    <ul>
      {posts.map((post, idx) => {
        return <Post post={post} key={post.category + idx} />
      })}
    </ul>
  )
}
