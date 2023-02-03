package com.agora.server.room.controller;

import com.agora.server.common.dto.ResponseDTO;
import com.agora.server.openvidu.service.OpenViduService;
import com.agora.server.room.controller.dto.*;
import com.agora.server.room.domain.Room;
import com.agora.server.room.service.DebateService;
import com.agora.server.room.service.RoomService;
import io.openvidu.java.client.OpenViduHttpException;
import io.openvidu.java.client.OpenViduJavaClientException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/v2")
public class RoomController {

    private final RoomService roomService;
    private final OpenViduService openViduService;
    private final DebateService debateService;

    /**
     * 방을 생성
     * @param rcDto
     * @return roomId와 방이 정상적으로 생성되었다는 메세지 리턴
     */
    @PostMapping("room/create")
    public ResponseEntity<ResponseDTO> roomCreate(@RequestBody RequestRoomCreateDto rcDto) throws OpenViduJavaClientException, OpenViduHttpException {
        Room createdRoom = Room.createRoom(rcDto.getRoomName(),rcDto.getRoomCreaterName(),rcDto.getRoomDebateType(),
                rcDto.getRoomOpinionLeft(),rcDto.getRoomOpinionRight(),
                rcDto.getRoomHashtags(),rcDto.getRoomThumbnailUrl(),rcDto.getRoomCategory());

        Long roomId;
        roomId = roomService.createRoom(createdRoom);

        String token = openViduService.createSession(roomId);

        ResponseRoomCreateDto responseRoomCreateDto = new ResponseRoomCreateDto();
        responseRoomCreateDto.setRoomId(roomId);
        responseRoomCreateDto.setToken(token);

        ResponseDTO responseDTO = new ResponseDTO();
        responseDTO.setBody(responseRoomCreateDto);
        responseDTO.setMessage("방이 정상적으로 생성되었습니다");
        responseDTO.setStatusCode(200);
        responseDTO.setState(true);
        return new ResponseEntity<>(responseDTO, HttpStatus.ACCEPTED);
    }

    /**
     * 추후 추가
     * roomstate == false 방에 입장하기로 room/enter 요청을 보냈는데
     * 그 사이에 roomstate == true로 바뀌면 에러 던지기
     *
     * 입장하려는 진영 토론자 수가 3명 꽉차있으면 에러 던지기
     */
    @PostMapping("room/enter")
    public ResponseEntity<ResponseDTO> roomEnter(@RequestBody RequestRoomEnterDto requestRoomEnterDto) throws OpenViduJavaClientException, OpenViduHttpException {

//        String token = openViduService.enterSession(requestRoomEnterDto.getRoomId(), requestRoomEnterDto.getType());

        ResponseRoomEnterBeforeStartDto responseRoomEnterBeforeStartDto = new ResponseRoomEnterBeforeStartDto();
        ResponseRoomEnterAfterStartDto responseRoomEnterAfterStartDto = new ResponseRoomEnterAfterStartDto();

        // 없어도 될 듯?
        boolean isEntered = true;

        if(requestRoomEnterDto.getRoomState()==false){
            switch (requestRoomEnterDto.getType()){
                case "pub":
                    roomService.enterRoomAsDebater(requestRoomEnterDto.getUserId(), requestRoomEnterDto.getRoomId(), requestRoomEnterDto.getUserSide());
                    // Redis Pub/Sub에서 입장 메시지 송신하는 부분
                    // type의 토론자 -> pub와 관전자 -> sub로 구분
                    // pub의 경우에만 메시지 송신
                    debateService.debaterEnter(requestRoomEnterDto);
                    break;
                case "sub":
                    roomService.enterRoomAsWatcher(requestRoomEnterDto.getRoomId());
                    break;
            }
            roomService.setRoomCurrentStatusBeforeStart(requestRoomEnterDto, responseRoomEnterBeforeStartDto);
            responseRoomEnterBeforeStartDto.setEnter(isEntered);
//            responseRoomEnterBeforeStartDto.setToken(token);
        } else if(requestRoomEnterDto.getRoomState()==true){

            roomService.enterRoomAsWatcher(requestRoomEnterDto.getRoomId());
            roomService.setRoomCurrentStatusAfterStart(requestRoomEnterDto, responseRoomEnterAfterStartDto);

            responseRoomEnterAfterStartDto.setEnter(isEntered);
//            responseRoomEnterAfterStartDto.setToken(token);
        }


        ResponseDTO responseDTO = new ResponseDTO();
        if(requestRoomEnterDto.getRoomState()==false){
            responseDTO.setBody(responseRoomEnterBeforeStartDto);
        } else if(requestRoomEnterDto.getRoomState()==true){
            responseDTO.setBody(responseRoomEnterAfterStartDto);
        }
        responseDTO.setMessage("정상적으로 입장하였습니다");
        responseDTO.setStatusCode(200);
        responseDTO.setState(true);
        return new ResponseEntity<>(responseDTO, HttpStatus.ACCEPTED);
    }

    /**
     * 방 나가기 api
     * Redis Pub/Sub 테스트용으로 틀만 만들어놨습니다.
     * 자유롭게 수정하세요
     */
    @PostMapping("room/leave")
    public ResponseEntity<ResponseDTO> roomLeave (@RequestBody RequestRoomEnterDto requestRoomEnterDto) throws OpenViduJavaClientException, OpenViduHttpException {

        if(requestRoomEnterDto.getType().equals("pub")){
            roomService.leaveRoomAsDebater(requestRoomEnterDto.getUserId(), requestRoomEnterDto.getRoomId(), requestRoomEnterDto.getUserSide());
        } else if(requestRoomEnterDto.getType().equals("sub")){
            roomService.leaveRoomAsWatcher(requestRoomEnterDto.getRoomId());
        }

        // Redis Pub/Sub에서 퇴장 메시지 송신하는 부분
        // type의 토론자 -> pub와 관전자 -> sub로 구분
        switch (requestRoomEnterDto.getType()){
            case "pub" :
                debateService.debaterLeave(requestRoomEnterDto);
                break;
            case "sub" :
                break;
        }

        ResponseDTO responseDTO = new ResponseDTO();
//        responseDTO.setBody(responseRoomEnterDto);
        responseDTO.setMessage("정상적으로 퇴장하였습니다");
        responseDTO.setStatusCode(200);
        responseDTO.setState(true);
        return new ResponseEntity<>(responseDTO, HttpStatus.ACCEPTED);
    }



}
