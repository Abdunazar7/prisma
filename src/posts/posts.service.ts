import { Injectable } from '@nestjs/common';
import { CreatePostDto, UpdatePostDto } from "./dto";
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

  create(createPostDto: CreatePostDto) {
    const { title, content, userId } = createPostDto;

    return this.prisma.posts.create({
      data: {
        title,
        content,
        userId,
      },
    });
  }

  findAll() {
    return this.prisma.posts.findMany({
      include: {
        user: true,
      },
    });
  }

  findOne(id: number) {
    return this.prisma.posts.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });
  }

  update(id: number, updatePostDto: UpdatePostDto) {
    return `This action updates a #${id} post`;
  }

  remove(id: number) {
    return `This action removes a #${id} post`;
  }
}
