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
import { pipe, switchMap, tap, catchError, of } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

// Define the shape of our state
type PostsState = {
  posts: Post[];
  total: number;
  skip: number;
  limit: number;
  isLoading: boolean;
  selectedPost: Post | null;
  isSinglePostLoading: boolean;
  isAddingPost: boolean;
  error: string | null;
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
  isAddingPost: false,
  error: null,
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
        // On nettoie les anciennes erreurs et on met le chargement
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(() =>
          postService.getAllPosts().pipe(
            tap((response) =>
              patchState(store, { ...response, isLoading: false })
            ),
            // --- GESTION DES ERREURS ---
            catchError((error: HttpErrorResponse) => {
              console.error('Failed to load posts:', error);
              // Met à jour le store avec le message d'erreur
              patchState(store, {
                isLoading: false,
                error: 'Impossible de charger la liste des posts.',
              });
              // Retourne un observable vide pour que la chaîne ne se brise pas
              return of(undefined);
            })
          )
        )
      )
    ),

    loadSinglePost: rxMethod<number>(
      pipe(
        // When loadPosts() is called, set isLoading to true
        tap(() =>
          patchState(store, {
            selectedPost: null,
            isSinglePostLoading: true,
            error: null,
          })
        ),
        // Use switchMap to call the API via the service
        switchMap((id) =>
          postService.getSinglePost(id).pipe(
            // When the API responds, update the state and set isLoading to false
            tap((post) => {
              patchState(store, {
                selectedPost: post,
                isSinglePostLoading: false,
              });
            }),
            catchError((error: HttpErrorResponse) => {
              console.error('Failed to load post:', error);
              patchState(store, {
                isSinglePostLoading: false,
                error: 'Impossible de charger le post. Veuillez réessayer.',
              });
              return of(undefined);
            })
          )
        )
      )
    ),

    addPost: rxMethod<Post>(
      pipe(
        // When loadPosts() is called, set isLoading to true
        tap(() => patchState(store, { isAddingPost: true, error: null })),
        // Use switchMap to call the API via the service
        switchMap((createdpost) =>
          postService.addPost(createdpost).pipe(
            // When the API responds, update the state and set isLoading to false
            tap((post) => {
              patchState(store, {
                selectedPost: post,
                isAddingPost: false,
              });
            }),
            catchError((error: HttpErrorResponse) => {
              console.error('Failed to add post:', error);
              patchState(store, {
                isAddingPost: false,
                error: "Impossible d'ajouter le post. Veuillez réessayer.",
              });
              return of(undefined);
            })
          )
        )
      )
    ),
  }))
);
