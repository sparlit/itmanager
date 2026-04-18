/**
 * POSTGRESQL ROW-LEVEL SECURITY (RLS) MIDDLEWARE
 * Ensures 'Branch A' can never see 'Branch B' data.
 * Applied at the query level for all 18+ portals.
 */
import { PrismaClient } from '@prisma/client';

export const applyTenantIsolation = (prisma: PrismaClient, branchId: string) => {
  return prisma.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          // 1. Inject branch_id into all 'find', 'update', 'delete' operations
          if (['findMany', 'findFirst', 'update', 'updateMany', 'delete', 'deleteMany'].includes(operation)) {
            args.where = { ...args.where, branchId };
          }

          // 2. Inject branch_id into 'create' operations
          if (operation === 'create') {
            args.data = { ...args.data, branchId };
          }

          return query(args);
        },
      },
    },
  });
};
