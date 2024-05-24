import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async signup(email: string, password: string) {
    // is email in use?
    const users = await this.usersService.find(email);
    if (users.length) {
      throw new BadRequestException('Email in use');
    }

    // Hash the user's password
    // generate a salt
    const salt = randomBytes(8).toString('hex');

    // hash the password with the salt
    const hash = (await scrypt(password, salt, 32)) as Buffer;

    // Join the hashed result with the salt
    const result = salt + '.' + hash.toString('hex');

    // Create a new user and save it
    const user = await this.usersService.create(email, result);

    // return the user
    return user;
  }

  async signin(email: string, password: string) {
    const [user] = await this.usersService.find(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    console.log(user);

    const [salt, storedHash] = user.password.split('.');
    console.log(salt);
    console.log('1');
    console.log(storedHash);

    const hash = (await scrypt(password, salt, 32)) as Buffer;

    if (storedHash !== hash.toString('hex')) {
      console.log('2');
      console.log(storedHash);
      console.log(hash.toString('hex'));
      throw new BadRequestException('Bad password');
    }

    return user;
  }
}
