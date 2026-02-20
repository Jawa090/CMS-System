import {
  Controller, Get, Post, Put, Delete, Param, Body,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // REMOVED
// import { RolesGuard } from '../auth/guards/roles.guard'; // REMOVED
// import { Roles } from '../auth/decorators/roles.decorator'; // REMOVED
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@ApiTags('Projects')
// @ApiBearerAuth() // REMOVED
// @UseGuards(JwtAuthGuard, RolesGuard) // REMOVED
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new project/site' })
  async create(@Body() dto: CreateProjectDto) {
    return this.projectsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all projects' })
  async findAll() {
    return this.projectsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a project by ID' })
  async findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a project' })
  async update(@Param('id') id: string, @Body() dto: UpdateProjectDto) {
    return this.projectsService.update(id, dto);
  }

  @Delete(':id')
  // @Roles('ADMIN', 'SUPER_ADMIN') // REMOVED
  @ApiOperation({ summary: 'Delete a project and all its data' })
  async delete(@Param('id') id: string) {
    return this.projectsService.delete(id);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get project statistics' })
  async stats(@Param('id') id: string) {
    return this.projectsService.getStats(id);
  }
}
