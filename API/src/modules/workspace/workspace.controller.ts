import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Patch,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WorkspaceService } from './workspace.service';
import { CreateColumnDto } from './dto/create-column.dto';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';

@ApiTags('Workspace')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('workspaces')
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Get full Kanban board for a project' })
  @ApiResponse({ status: 200, description: 'Workspace with columns and cards' })
  @ApiResponse({ status: 404, description: 'Workspace not found' })
  getByProject(@Param('projectId', ParseUUIDPipe) projectId: string) {
    return this.workspaceService.getByProject(projectId);
  }

  @Post(':workspaceId/columns')
  @ApiOperation({ summary: 'Add a new Kanban column' })
  @ApiResponse({ status: 201, description: 'Column created' })
  addColumn(
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @Body() dto: CreateColumnDto,
  ) {
    return this.workspaceService.addColumn(workspaceId, dto);
  }

  @Post('columns/:columnId/cards')
  @ApiOperation({ summary: 'Create a new task card in a column' })
  @ApiResponse({ status: 201, description: 'Card created' })
  addCard(
    @Param('columnId', ParseUUIDPipe) columnId: string,
    @Body() dto: CreateCardDto,
  ) {
    return this.workspaceService.addCard(columnId, dto);
  }

  @Patch('cards/:cardId')
  @ApiOperation({ summary: 'Update card (move, priority, assignee)' })
  @ApiResponse({ status: 200, description: 'Card updated' })
  updateCard(
    @Param('cardId', ParseUUIDPipe) cardId: string,
    @Body() dto: UpdateCardDto,
  ) {
    return this.workspaceService.updateCard(cardId, dto);
  }
}
