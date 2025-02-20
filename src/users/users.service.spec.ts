import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './users.service';
import { FirebaseService } from '../firebase/firebase.service';

describe('UsersService', () => {
  let service: UserService;
  let firebaseService: FirebaseService;

  beforeEach(async () => {
    const mockFirebaseService = {
      getFirestore: jest.fn().mockReturnValue({
        collection: jest.fn().mockReturnValue({
          doc: jest.fn().mockReturnValue({
            set: jest.fn().mockResolvedValue(undefined),
            update: jest.fn().mockResolvedValue(undefined),
          }),
          where: jest.fn().mockReturnValue({
            get: jest.fn().mockResolvedValue({
              empty: false,
            }),
          }),
          orderBy: jest.fn().mockReturnThis(),
          offset: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          get: jest.fn().mockResolvedValue({ docs: [] }),
        }),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: FirebaseService,
          useValue: mockFirebaseService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    firebaseService = module.get<FirebaseService>(FirebaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    it('should throw an error if email is already in use', async () => {
      const createUserDto = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '1234567890',
      };

      // Simulate email already in use scenario
      (firebaseService.getFirestore as jest.Mock).mockReturnValue({
        collection: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            get: jest.fn().mockResolvedValue({
              empty: false,
            }),
          }),
        }),
      });

      await expect(service.createUser(createUserDto)).rejects.toThrowError(
        'Email is already in use',
      );
    });
  });
});
