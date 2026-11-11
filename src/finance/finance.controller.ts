import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/admin.guards';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthenticatedRequest } from '../common/types/authenticated-request';
import { CreateExpenseDto } from './dtos/create-expense.dto';
import { FinanceService } from './finance.service';

@Controller('finance')
@Roles(Role.ADMIN, Role.BARBEIRO)
@UseGuards(AuthGuard, RolesGuard)
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get('expenses')
  findExpenses(@Query('month') month: string) {
    return this.financeService.findExpenses(month);
  }

  @Post('expenses')
  createExpense(@Body() dto: CreateExpenseDto, @Req() req: AuthenticatedRequest) {
    return this.financeService.createExpense(dto, req.user.id);
  }
}
