import { TestBed } from '@angular/core/testing';
import { PostStore } from './post.store';
import { PostService } from '../services/post.service';
import { of, throwError } from 'rxjs';
import { PostApiResponse } from '../models/post.model';

class MockPostService {
  getAllPosts = jest.fn();
}

describe('PostStore', () => {
  let store: InstanceType<typeof PostStore>;
  let mockPostService: MockPostService;

  beforeEach(() => {
    mockPostService = new MockPostService();

    TestBed.configureTestingModule({
      providers: [
        PostStore,

        { provide: PostService, useValue: mockPostService },
      ],
    });

    store = TestBed.inject(PostStore);
  });

  it('should have a correct initial state', () => {
    // Test 1: L'état initial
    expect(store.posts()).toEqual([]);
    expect(store.isLoading()).toBe(false);
    expect(store.total()).toBe(0);
    expect(store.error()).toBeNull();
  });

  describe('#loadPosts (success case)', () => {
    it('should update state correctly when API call succeeds', () => {
      // Arrange: Préparez la réponse que le service mocké doit renvoyer
      const mockResponse: PostApiResponse = {
        posts: [
          {
            id: 1,
            title: 'Test Post',
            body: '...',
            userId: '1',
            tags: [],
            reactions: { likes: 0, dislikes: 0 },
          },
        ],
        total: 1,
        skip: 0,
        limit: 10,
      };
      // Quand getAllPosts est appelé, il doit retourner un observable avec nos données mockées
      mockPostService.getAllPosts.mockReturnValue(of(mockResponse));

      // Act: Appelez la méthode du store
      store.loadPosts();

      // Assert: Vérifiez que l'état du store a été mis à jour correctement
      expect(store.isLoading()).toBe(false); // Il doit être repassé à false à la fin
      expect(store.posts()).toEqual(mockResponse.posts);
      expect(store.total()).toBe(1);
      expect(store.error()).toBeNull(); // Pas d'erreur
      expect(mockPostService.getAllPosts).toHaveBeenCalledTimes(1); // Vérifie que le service a bien été appelé
    });
  });

  describe('#loadPosts (error case)', () => {
    it('should update the error state when API call fails', () => {
      // Arrange: Le service mocké doit maintenant renvoyer une erreur
      const errorResponse = { status: 500, message: 'Server Error' };
      mockPostService.getAllPosts.mockReturnValue(
        throwError(() => errorResponse)
      );

      // Act
      store.loadPosts();

      // Assert
      expect(store.isLoading()).toBe(false);
      expect(store.posts()).toEqual([]); // Le tableau des posts doit rester vide
      expect(store.error()).toBe('Impossible de charger la liste des posts.'); // Le message d'erreur est bien présent
      expect(mockPostService.getAllPosts).toHaveBeenCalledTimes(1);
    });
  });

  describe('computed signals', () => {
    it('should calculate totalPages correctly', () => {
      // Arrange
      const mockResponse: PostApiResponse = {
        posts: [],
        total: 25,
        skip: 0,
        limit: 10,
      };
      mockPostService.getAllPosts.mockReturnValue(of(mockResponse));

      // Act
      store.loadPosts();

      // Assert
      // 25 / 10 = 2.5, donc Math.ceil donne 3 pages
      expect(store.totalPages()).toBe(3);
    });
  });
});
