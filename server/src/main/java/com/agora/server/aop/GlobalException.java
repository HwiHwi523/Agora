package com.agora.server.aop;

import com.agora.server.common.dto.ResponseDTO;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class GlobalException {
    @ExceptionHandler(NullPointerException.class)
    public ResponseEntity<ResponseDTO> NullPointerException(NullPointerException nullPointerException) {
        ResponseDTO res = new ResponseDTO();
        res.setMessage("값이 존재하지 않습니다");
        res.setStatusCode(HttpStatus.NOT_FOUND.value());
        return new ResponseEntity<>(res, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ResponseDTO> RuntimeException(RuntimeException r) {
        ResponseDTO res = new ResponseDTO();
        res.setMessage("run time error");
        return new ResponseEntity<>(res, HttpStatus.REQUEST_TIMEOUT);
    }

}