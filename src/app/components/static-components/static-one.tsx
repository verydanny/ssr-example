import React from 'react'
import style from './style.css'
import { RecommendedPosts } from './shuffler'
import { posts } from '../../../data/random-posts'

const thePosts = new Array(1000).fill(posts)

export const StaticOne = ({ name }: { name: string }) => (
  <div>
    <p className={style.staticOne}>
      Hello, {name}, I&lsquo;m <strong>StaticOne</strong> component
    </p>
    <RecommendedPosts posts={thePosts} />
  </div>
)
