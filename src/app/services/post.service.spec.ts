import { TestBed } from '@angular/core/testing';
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { PostService } from './post.service';
import { environment } from '../../environments/environment';
// Use your actual models
import { PostApiResponse, Post } from '../models/post.model';

describe('PostService', () => {
  let service: PostService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        PostService,
      ],
    });
    service = TestBed.inject(PostService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('#getAllPosts', () => {
    it('should return a list of posts and call the GET method', () => {
      const mockResponse: PostApiResponse = {
        posts: [
          {
            id: 1,
            title: 'Post 1',
            body: 'Body 1',
            userId: '1',
            tags: [],
            reactions: { likes: 10, dislikes: 1 },
          },
          {
            id: 2,
            title: 'Post 2',
            body: 'Body 2',
            userId: '2',
            tags: ['abc', 'DEF'],
            reactions: { likes: 5, dislikes: 0 },
          },
        ],
        total: 2,
        skip: 0,
        limit: 2,
      };
      let actualResponse: PostApiResponse | undefined;

      service.getAllPosts().subscribe((response) => {
        actualResponse = response;
      });

      const req = httpTestingController.expectOne(
        `${environment.apiUrl}/posts`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
      expect(actualResponse).toEqual(mockResponse);
    });
  });

  describe('#getSinglePost', () => {
    it('should return a single post by its ID', () => {
      const postId = 1;
      // Arrange: Mock Post matches your model structure
      const mockPost: Post = {
        id: postId,
        title: 'Test Post',
        body: 'Hello',
        userId: '99',
        tags: ['test'],
        reactions: { likes: 1, dislikes: 0 },
      };

      let actualPost: Post | undefined;
      service.getSinglePost(postId).subscribe((post) => {
        actualPost = post;
      });

      const req = httpTestingController.expectOne(
        `${environment.apiUrl}/posts/${postId}`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockPost);

      expect(actualPost).toEqual(mockPost);
    });
  });

  describe('#addPost', () => {
    it('should send a POST request and return the created post', () => {
      // Arrange: Data to send
      const newPostData = { title: 'New Post', body: 'Content', userId: '5' };
      // Arrange: Expected response from the server, matching your Post model
      const mockResponse: Post = {
        id: 101,
        ...newPostData,
        tags: [],
        reactions: { likes: 0, dislikes: 0 },
      };

      let actualResponse: Post | undefined;
      service.addPost(newPostData).subscribe((response) => {
        actualResponse = response;
      });

      const req = httpTestingController.expectOne(
        `${environment.apiUrl}/posts/add`
      );
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newPostData);
      req.flush(mockResponse);

      expect(actualResponse).toEqual(mockResponse);
    });
  });

  //   describe('#deletePost', () => {
  //     it('should send a DELETE request to the correct URL', () => {
  //       const postIdToDelete = 15;
  //       // Arrange: Mock of the deleted post, matching your model
  //       const mockDeletedPost: Post = {
  //         id: postIdToDelete,
  //         title: 'Deleted',
  //         body: '...',
  //         userId: '1',
  //         tags: [],
  //         reactions: { likes: 0, dislikes: 0 },
  //       };

  //       let actualResponse: Post | undefined;
  //       service.deletePost(postIdToDelete).subscribe((res) => {
  //         actualResponse = res;
  //       });

  //       const req = httpTestingController.expectOne(
  //         `${environment.apiUrl}/posts/${postIdToDelete}`
  //       );
  //       expect(req.request.method).toBe('DELETE');
  //       req.flush(mockDeletedPost);

  //       expect(actualResponse).toEqual(mockDeletedPost);
  //     });
  //   });
});
