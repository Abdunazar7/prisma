import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateUserDto, UpdateUserDto, SignInUserDto } from "./dto";
import * as bcrypt from "bcrypt";

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const { name, email, phone, password, confirm_password } = createUserDto;

    if (password !== confirm_password) {
      throw new BadRequestException("Parollar mos emas");
    }

    const hashedPassword = await bcrypt.hash(password, 7);

    return this.prisma.users.create({
      data: {
        name,
        email,
        phone,
        hashedPassword,
      },
    });
  }

  findAll() {
    return this.prisma.users.findMany({
      include: {
        posts: true,
      },
    });
  }

  findOne(id: number) {
    return this.prisma.users.findUnique({
      where: { id },
      include: {
        posts: true,
      },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const { name, email, phone, password } = updateUserDto;

    let hashedPassword;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 7);
    }

    return this.prisma.users.update({
      where: { id },
      data: {
        name,
        email,
        phone,
        ...(hashedPassword && { hashedPassword }),
      },
    });
  }

  remove(id: number) {
    return this.prisma.users.delete({ where: { id } });
  }
}
