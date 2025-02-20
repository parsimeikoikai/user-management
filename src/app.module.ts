import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { WebhookModule } from './webhook/webhook.module';
import { FirebaseModule } from './firebase/firebase.module';

@Module({
  imports: [FirebaseModule, UsersModule, WebhookModule],
  providers: [],
})
export class AppModule {}
