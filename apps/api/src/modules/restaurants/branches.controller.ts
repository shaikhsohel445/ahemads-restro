import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Post,
  Query,
  UsePipes,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  createBranchSchema,
  type CreateBranchDto,
  type SessionUser,
} from '@ahemads-restro/types';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { BranchAccessService } from '../../common/services/branch-access.service';
import { Auth } from '../../common/decorators/auth.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PrismaService } from '../../prisma/prisma.service';

// Roles that run the whole restaurant see every branch of it; everyone else
// sees only the branches they were assigned to (UserBranch).
const ALL_BRANCH_ROLES = ['OWNER', 'ADMINISTRATOR'];

@ApiTags('branches')
@Controller('v1/branches')
export class BranchesController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly branchAccess: BranchAccessService,
  ) {}

  @Auth()
  @Get()
  listBranches(@CurrentUser() user: SessionUser) {
    const sees = ALL_BRANCH_ROLES.includes(user.roleName)
      ? {}
      : { users: { some: { userId: user.id } } };
    return this.prisma.branch.findMany({
      where: { restaurantId: user.restaurantId, isActive: true, ...sees },
      orderBy: { name: 'asc' },
    });
  }

  // Adds a branch to the signed-in user's restaurant. Owners and
  // administrators only (they see every branch); the new branch copies the
  // country and tax set-up of the branch the request comes from, and the
  // creator is assigned to it.
  @Auth('settings.manage')
  @Post()
  @UsePipes(new ZodValidationPipe(createBranchSchema))
  async createBranch(
    @CurrentUser() user: SessionUser,
    @Query('branchId') fromBranchId: string,
    @Body() body: CreateBranchDto,
  ) {
    if (!ALL_BRANCH_ROLES.includes(user.roleName)) {
      throw new ForbiddenException(
        'Only the owner or an administrator can add branches',
      );
    }
    await this.branchAccess.assertAccess(user.restaurantId, fromBranchId);
    const from = await this.prisma.branch.findUniqueOrThrow({
      where: { id: fromBranchId },
    });
    const branch = await this.prisma.branch.create({
      data: {
        restaurantId: user.restaurantId,
        name: body.name,
        address: body.address || null,
        phone: body.phone || null,
        country: from.country,
        taxRegime: from.taxRegime,
        taxMode: from.taxMode,
        taxLabel: from.taxLabel,
        taxId: from.taxId,
        gstNumber: from.gstNumber,
        printerPaperWidthMm: from.printerPaperWidthMm,
        printerCodepage: from.printerCodepage,
      },
    });
    await this.prisma.userBranch.create({
      data: { userId: user.id, branchId: branch.id },
    });
    return branch;
  }
}
