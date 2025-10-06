import {
  signalStore,
  withState,
  withMethods,
  patchState,
  withComputed,
} from '@ngrx/signals';
import { Post, PostApiResponse } from '../models/post.model';
import { computed, inject } from '@angular/core';
import { PostService } from '../services/post.service';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';

// Define the shape of our state
type PostsState = {
  posts: Post[];
  total: number;
  skip: number;
  limit: number;
  isLoading: boolean;
  selectedPost: null;
  isSinglePostLoading: boolean;
};

// Define the initial state
const initialState: PostsState = {
  posts: [],
  total: 0,
  skip: 0,
  limit: 10,
  isLoading: false,
  selectedPost: null,
  isSinglePostLoading: false,
};

// Create the store!
export const PostStore = signalStore(
  // 1. Give it a name (optional, but great for devtools)
  { providedIn: 'root' },

  // 2. Define the initial state shape
  withState(initialState),

  withComputed(({ posts, total, limit, skip }) => ({
    // A signal that calculates the current page number
    currentPage: computed(() => Math.floor(skip() / limit())),
    // A signal that tells us if there are any posts
    hasPosts: computed(() => posts().length > 0),
    // A signal calculating total pages
    totalPages: computed(() => Math.ceil(total() / limit())),
  })),

  // 3. Define methods that can change the state
  withMethods((store, postService = inject(PostService)) => ({
    // Use rxMethod to handle the async operation
    loadPosts: rxMethod<void>(
      pipe(
        // When loadPosts() is called, set isLoading to true
        tap(() => patchState(store, { isLoading: true })),
        // Use switchMap to call the API via the service
        switchMap(() => {
          return postService.getAllPosts().pipe(
            // When the API responds, update the state and set isLoading to false
            tap((response) =>
              patchState(store, {
                ...response,
                isLoading: false,
              })
            )
          );
        })
      )
    ),

    loadSinglePost: rxMethod<number>(
      pipe(
        // When loadPosts() is called, set isLoading to true
        tap(() =>
          patchState(store, { selectedPost: null, isSinglePostLoading: true })
        ),
        // Use switchMap to call the API via the service
        switchMap((id) => {
          return postService.getSinglePost(id).pipe(
            // When the API responds, update the state and set isLoading to false
            tap((response) =>
              patchState(store, {
                ...response,
                isLoading: false,
              })
            )
          );
        })
      )
    ),
  }))
);
