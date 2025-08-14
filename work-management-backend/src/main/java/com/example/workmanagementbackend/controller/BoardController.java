package com.example.workmanagementbackend.controller;

import com.example.workmanagementbackend.dto.BoardDTO;
import com.example.workmanagementbackend.service.BoardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/boards")
public class BoardController {

    @Autowired
    private BoardService boardService;

    @GetMapping("/workspace/{workspaceId}")
    public ResponseEntity<List<BoardDTO>> getBoardsByWorkspaceId(@PathVariable Long workspaceId) {
        return ResponseEntity.ok(boardService.getBoardsByWorkspaceId(workspaceId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BoardDTO> getBoardById(@PathVariable Long id) {
        return ResponseEntity.ok(boardService.getBoardById(id));
    }

    @PostMapping
    public ResponseEntity<BoardDTO> createBoard(@RequestBody BoardDTO boardDTO) {
        return ResponseEntity.ok(boardService.createBoard(boardDTO));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BoardDTO> updateBoard(@PathVariable Long id, @RequestBody BoardDTO boardDTO) {
        return ResponseEntity.ok(boardService.updateBoard(id, boardDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBoard(@PathVariable Long id) {
        boardService.deleteBoard(id);
        return ResponseEntity.noContent().build();
    }
}
