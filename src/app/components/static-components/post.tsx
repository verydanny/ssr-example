import React from 'react'

interface Post {
  post: {
    title: string
    text: string
    category: string
  }
}

export function Post({ post }: Post) {
  return (
    <li>
      <p>{post.title}</p>
      <p>{post.text}</p>
      <p>{post.category}</p>
    </li>
  )
}
