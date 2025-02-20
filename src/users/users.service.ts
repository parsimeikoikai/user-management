import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { NotFoundException } from '../utils/not-found-exception';
@Injectable()
export class UserService {
  [x: string]: any;
  constructor(private readonly firebaseService: FirebaseService) {}

  async getUser(id: string) {
    const db = this.firebaseService.getFirestore();
    const userDocRef = db.collection('users').doc(id);
    const userSnapshot = await userDocRef.get();
    if (!userSnapshot.exists) {
      throw new NotFoundException('User not found');
    }

    return userSnapshot.data();
  }
  async createUser(createUserDto: CreateUserDto) {
    const db = this.firebaseService.getFirestore();

    const existingUser = await db
      .collection('users')
      .where('email', '==', createUserDto.email.toLowerCase())
      .get();

    if (!existingUser.empty) {
      throw new Error('Email is already in use');
    }

    const userRef = db.collection('users').doc();
    const userData = {
      name: createUserDto.name,
      email: createUserDto.email.toLowerCase(),
      phone: createUserDto.phone,
    };

    await userRef.set(userData);

    return { id: userRef.id };
  }
  async getUsers(page: number, limit: number) {
    const db = this.firebaseService.getFirestore();
    const usersCollection = db.collection('users');

    const snapshot = await usersCollection
      .orderBy('name')
      .offset((page - 1) * limit)
      .limit(limit)
      .get();

    const users = snapshot.docs.map((doc) => doc.data());
    return users;
  }
  async updateUser(id: string, updateUserDto: UpdateUserDto) {
    const db = this.firebaseService.getFirestore();

    const userDocRef = db.collection('users').doc(id);
    const userSnapshot = await userDocRef.get();

    if (!userSnapshot.exists) {
      console.log(`User with ID ${id} not found`);
      throw new Error('User not found');
    }

    await userDocRef.update({
      name: updateUserDto.name,
      phone: updateUserDto.phone,
    });

    return {
      id,
      name: updateUserDto.name,
      phone: updateUserDto.phone,
    };
  }
}
