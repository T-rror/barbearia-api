import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseDto } from './dtos/create-expense.dto';

@Injectable()
export class FinanceService {
  constructor(private prisma: PrismaService) {}

  findExpenses(month: string) {
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
      throw new BadRequestException('Informe o mês no formato AAAA-MM');
    }
    const [year, monthNumber] = month.split('-').map(Number);
    const start = new Date(Date.UTC(year, monthNumber - 1, 1));
    const end = new Date(Date.UTC(year, monthNumber, 1));
    return this.prisma.expense.findMany({
      where: { date: { gte: start, lt: end } },
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
    });
  }

  createExpense(dto: CreateExpenseDto, userId: string) {
    return this.prisma.expense.create({
      data: {
        description: dto.description.trim(),
        category: dto.category.trim(),
        amount: dto.amount,
        date: dto.date ? new Date(dto.date) : new Date(),
        createdById: userId,
      },
    });
  }
}
