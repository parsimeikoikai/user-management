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
  async getUsers(limit: number, cursor: string | null) {
    const db = this.firebaseService.getFirestore();
    const usersCollection = db.collection('users');

    let query = usersCollection.orderBy('name').limit(limit);

    if (cursor) {
      const snapshot = await usersCollection.doc(cursor).get();
      if (snapshot.exists) {
        query = query.startAfter(snapshot);
      }
    }

    const snapshot = await query.get();

    const users = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const nextCursor =
      snapshot.docs.length > 0
        ? snapshot.docs[snapshot.docs.length - 1].id
        : null;

    return {
      users,
      nextCursor,
    };
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
