import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AuditLevel, AuditLog, AuditLogDocument } from './schemas/audit-log.schema';

export interface RecordAuditEntry {
  actorId?: string;
  actorLabel?: string;
  actorRole?: string;
  action: string;
  targetType?: string;
  targetId?: string;
  details?: string;
  metadata?: Record<string, unknown>;
  level?: AuditLevel;
  ip?: string;
}

export interface AuditQuery {
  level?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectModel(AuditLog.name)
    private readonly auditLogModel: Model<AuditLogDocument>,
  ) {}

  /*
   * Enregistre une entrée dans le journal d'audit.
   * Ne doit jamais faire échouer l'action métier appelante :
   * les erreurs d'écriture du log sont volontairement avalées.
   */
  async record(entry: RecordAuditEntry) {
    try {
      await this.auditLogModel.create({
        actor:
          entry.actorId && Types.ObjectId.isValid(entry.actorId)
            ? new Types.ObjectId(entry.actorId)
            : undefined,
        actorLabel: entry.actorLabel,
        actorRole: entry.actorRole,
        action: entry.action,
        targetType: entry.targetType,
        targetId: entry.targetId,
        details: entry.details,
        metadata: entry.metadata,
        level: entry.level ?? AuditLevel.INFO,
        ip: entry.ip,
      });
    } catch {
      // La traçabilité ne doit jamais bloquer l'action principale.
    }
  }

  async findAll(query: AuditQuery) {
    const page = Math.max(1, query.page ?? 1);
    const pageSize = Math.min(100, Math.max(1, query.pageSize ?? 50));

    const filter: Record<string, unknown> = {};

    if (query.level && query.level !== 'ALL') {
      filter.level = query.level;
    }

    if (query.search) {
      const regex = { $regex: this.escapeRegex(query.search), $options: 'i' };
      filter.$or = [
        { action: regex },
        { actorLabel: regex },
        { details: regex },
        { targetType: regex },
      ];
    }

    const [items, total] = await Promise.all([
      this.auditLogModel
        .find(filter)
        .populate('actor', 'firstName lastName email role')
        .sort({ createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .exec(),
      this.auditLogModel.countDocuments(filter).exec(),
    ]);

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  private escapeRegex(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
