import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workspace } from './workspace.entity';
import { KanbanColumn } from './kanban-column.entity';
import { KanbanCard } from './kanban-card.entity';
import { CreateColumnDto } from './dto/create-column.dto';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';

@Injectable()
export class WorkspaceService {
  constructor(
    @InjectRepository(Workspace)
    private readonly workspaceRepo: Repository<Workspace>,
    @InjectRepository(KanbanColumn)
    private readonly columnRepo: Repository<KanbanColumn>,
    @InjectRepository(KanbanCard)
    private readonly cardRepo: Repository<KanbanCard>,
  ) {}

  async initializeDefaultWorkspace(projectId: string): Promise<Workspace> {
    const workspace = this.workspaceRepo.create({
      projectId,
      name: 'Project Board',
    });
    const saved = await this.workspaceRepo.save(workspace);

    const defaultColumns = [
      { title: 'To Do', position: 0 },
      { title: 'In Progress', position: 1 },
      { title: 'Done', position: 2 },
    ];

    const columns = defaultColumns.map((col) =>
      this.columnRepo.create({ ...col, workspaceId: saved.id }),
    );
    await this.columnRepo.save(columns);

    return this.getById(saved.id);
  }

  async getByProject(projectId: string): Promise<Workspace> {
    const workspace = await this.workspaceRepo.findOne({
      where: { projectId },
      relations: ['columns', 'columns.cards', 'columns.cards.assignee'],
      order: { columns: { position: 'ASC' } },
    });
    if (!workspace) {
      throw new NotFoundException(
        `Workspace for project ${projectId} not found`,
      );
    }
    return workspace;
  }

  async getById(id: string): Promise<Workspace> {
    const workspace = await this.workspaceRepo.findOne({
      where: { id },
      relations: ['columns', 'columns.cards'],
    });
    if (!workspace) {
      throw new NotFoundException(`Workspace ${id} not found`);
    }
    return workspace;
  }

  async addColumn(
    workspaceId: string,
    dto: CreateColumnDto,
  ): Promise<KanbanColumn> {
    const workspace = await this.getById(workspaceId);
    const maxPosition = workspace.columns?.length ?? 0;

    const column = this.columnRepo.create({
      ...dto,
      position: dto.position ?? maxPosition,
      workspaceId,
    });
    return this.columnRepo.save(column);
  }

  async addCard(columnId: string, dto: CreateCardDto): Promise<KanbanCard> {
    const column = await this.columnRepo.findOne({ where: { id: columnId } });
    if (!column) {
      throw new NotFoundException(`Column ${columnId} not found`);
    }

    const card = this.cardRepo.create({ ...dto, columnId });
    return this.cardRepo.save(card);
  }

  async updateCard(cardId: string, dto: UpdateCardDto): Promise<KanbanCard> {
    const card = await this.cardRepo.findOne({ where: { id: cardId } });
    if (!card) {
      throw new NotFoundException(`Card ${cardId} not found`);
    }

    if (dto.columnId) {
      const targetColumn = await this.columnRepo.findOne({
        where: { id: dto.columnId },
      });
      if (!targetColumn) {
        throw new NotFoundException(`Column ${dto.columnId} not found`);
      }
    }

    Object.assign(card, dto);
    return this.cardRepo.save(card);
  }
}
