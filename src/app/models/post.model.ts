export interface Post {
  id: number;
  title: string;
  body: string;
  userId: string;
  tags: string[];
  reactions: {
    likes: number;
    dislikes: number;
  };
}

// DummyJSON wraps its user list in this response object
export interface PostApiResponse {
  posts: Post[];
  total: number;
  skip: number;
  limit: number;
}
