import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../global/BaseEntity';
import { TravelCourse } from './TravelCourse.entity';
import { ChatRole } from './ChatRole.enum';

/**
 * CourseAiChat Entity
 * @description
 * - 여행 코스 AI 채팅 메시지 엔티티
 * - 사용자와 AI 간의 로드맵 수정 대화 기록
 */
@Entity('course_ai_chat_table')
export class CourseAiChat extends BaseEntity {
  @Column({
    type: 'enum',
    enum: ChatRole,
    name: 'role',
    nullable: false,
    comment: '메시지 발신자 (USER: 사용자, ASSISTANT: AI)',
  })
  role: ChatRole;

  @Column({
    type: 'text',
    name: 'content',
    nullable: false,
    comment: '메시지 내용',
  })
  content: string;

  @ManyToOne(() => TravelCourse, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'course_id' })
  travelCourse: TravelCourse;
}