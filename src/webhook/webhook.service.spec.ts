import { Test, TestingModule } from '@nestjs/testing';
import { WebhookService } from './webhook.service';
import { FirebaseService } from '../firebase/firebase.service';

describe('WebhookService', () => {
  let service: WebhookService;

  beforeEach(async () => {
    const mockFirebaseService = {
      getFirestore: jest.fn().mockReturnValue({
        collection: jest.fn().mockReturnValue({
          doc: jest.fn().mockReturnValue({
            set: jest.fn().mockResolvedValue(undefined),
          }),
        }),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebhookService,
        {
          provide: FirebaseService,
          useValue: mockFirebaseService,
        },
      ],
    }).compile();

    service = module.get<WebhookService>(WebhookService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('processMessage', () => {
    it('should throw an error if rate limit is exceeded', async () => {
      const payload = {
        message: 'Hello!',
        phone: '1234567890',
      };

      const originalCheckRateLimit = service['checkRateLimit'];
      service['checkRateLimit'] = jest.fn().mockReturnValueOnce(false);

      await expect(service.processMessage(payload)).rejects.toThrowError(
        'Rate limit exceeded. Please try again in a minute.',
      );

      service['checkRateLimit'] = originalCheckRateLimit;
    });

    it('should process the message and return a response', async () => {
      const payload = {
        message: 'Hello!',
        phone: '1234567890',
      };

      const response = await service.processMessage(payload);
      expect(response).toEqual({ reply: 'Your message has been received.' });
    });

    it('should return support contact for "help" message', async () => {
      const payload = {
        message: 'Help',
        phone: '1234567890',
      };

      const response = await service.processMessage(payload);
      expect(response).toEqual({
        reply: 'Support contact: support@company.com',
      });
    });
  });
});
