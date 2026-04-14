import { ApiProperty } from '@nestjs/swagger';
import { CourseAiChat } from '../../../../course/entity/CourseAiChat.entity';
import { ChatRole } from '../../../../course/entity/ChatRole.enum';

export class ItineraryChatHistoryItemResponse {
  @ApiProperty({ description: '채팅 메시지 ID' })
  id: string;

  @ApiProperty({ description: '메시지 발신자', enum: ChatRole })
  role: ChatRole;

  @ApiProperty({ description: '메시지 내용' })
  content: string;

  @ApiProperty({ description: '메시지 생성 시각' })
  createdAt: Date;

  static from(chat: CourseAiChat): ItineraryChatHistoryItemResponse {
    const response = new ItineraryChatHistoryItemResponse();
    response.id = chat.id;
    response.role = chat.role;
    response.content = chat.content;
    response.createdAt = chat.createdAt;
    return response;
  }
}

export class ItineraryChatHistoryResponse {
  @ApiProperty({
    description: '로드맵 수정 채팅 내역',
    type: [ItineraryChatHistoryItemResponse],
  })
  chats: ItineraryChatHistoryItemResponse[];

  static from(
    chats: ItineraryChatHistoryItemResponse[],
  ): ItineraryChatHistoryResponse {
    const response = new ItineraryChatHistoryResponse();
    response.chats = chats;
    return response;
  }
}
