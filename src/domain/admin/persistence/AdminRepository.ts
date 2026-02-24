import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from '../entity/Admin.entity';

/**
 * AdminRepository
 * @description
 * - Admin 엔티티에 대한 데이터 접근 계층
 */
@Injectable()
export class AdminRepository {
  constructor(
    @InjectRepository(Admin)
    private readonly repository: Repository<Admin>,
  ) {}

  async findByEmail(email: string): Promise<Admin | null> {
    return this.repository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<Admin | null> {
    return this.repository.findOne({ where: { id } });
  }

  async save(admin: Admin): Promise<Admin> {
    return this.repository.save(admin);
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.repository.count({ where: { email } });
    return count > 0;
  }
}
