import pygame
import random
import time

# Initialize pygame
pygame.init()

# Colors
BLACK = (0, 0, 0)
WHITE = (255, 255, 255)
GRAY = (128, 128, 128)
RED = (255, 0, 0)
GREEN = (0, 255, 0)
BLUE = (0, 0, 255)
CYAN = (0, 255, 255)
MAGENTA = (255, 0, 255)
YELLOW = (255, 255, 0)
ORANGE = (255, 165, 0)

# Game constants
CELL_SIZE = 30
GRID_WIDTH = 10
GRID_HEIGHT = 20
SIDEBAR_WIDTH = 200
SCREEN_WIDTH = CELL_SIZE * GRID_WIDTH + SIDEBAR_WIDTH
SCREEN_HEIGHT = CELL_SIZE * GRID_HEIGHT
GAME_AREA_LEFT = 0

# Piece shapes
SHAPES = [
    [[1, 1, 1, 1]],  # I
    [[1, 1], [1, 1]], # O
    [[1, 1, 1], [0, 1, 0]], # T
    [[1, 1, 1], [1, 0, 0]], # J
    [[1, 1, 1], [0, 0, 1]], # L
    [[0, 1, 1], [1, 1, 0]], # S
    [[1, 1, 0], [0, 1, 1]]  # Z
]

# Piece colors
COLORS = [CYAN, YELLOW, MAGENTA, BLUE, ORANGE, GREEN, RED]

# Create the screen
screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
pygame.display.set_caption("Tetris")

# Clock for controlling game speed
clock = pygame.time.Clock()

class Tetris:
    def __init__(self):
        self.grid = [[0 for _ in range(GRID_WIDTH)] for _ in range(GRID_HEIGHT)]
        self.current_piece = self.new_piece()
        self.next_piece = self.new_piece()
        self.held_piece = None
        self.can_hold = True
        self.game_over = False
        self.score = 0
        self.level = 1
        self.lines_cleared = 0
        self.fall_time = 0
        self.fall_speed = 500  # ms
        self.last_fall_time = pygame.time.get_ticks()
        self.paused = False
    
    def new_piece(self):
        # Choose a random shape and color
        shape_idx = random.randint(0, len(SHAPES) - 1)
        shape = SHAPES[shape_idx]
        color = COLORS[shape_idx]
        
        # Position the piece at the top center
        x = GRID_WIDTH // 2 - len(shape[0]) // 2
        y = 0
        
        return {'shape': shape, 'color': color, 'x': x, 'y': y}
    
    def valid_move(self, piece, x_offset=0, y_offset=0):
        for y, row in enumerate(piece['shape']):
            for x, cell in enumerate(row):
                if cell:
                    new_x = piece['x'] + x + x_offset
                    new_y = piece['y'] + y + y_offset
                    if (new_x < 0 or new_x >= GRID_WIDTH or 
                        new_y >= GRID_HEIGHT or 
                        (new_y >= 0 and self.grid[new_y][new_x])):
                        return False
        return True
    
    def rotate_piece(self):
        # Transpose the shape matrix and reverse each row to rotate 90 degrees
        rotated = [list(row) for row in zip(*self.current_piece['shape'][::-1])]
        
        old_shape = self.current_piece['shape']
        self.current_piece['shape'] = rotated
        
        # If rotation causes collision, try wall kicks
        if not self.valid_move(self.current_piece):
            # Try moving left
            if self.valid_move(self.current_piece, -1, 0):
                self.current_piece['x'] -= 1
            # Try moving right
            elif self.valid_move(self.current_piece, 1, 0):
                self.current_piece['x'] += 1
            # Try moving up (useful when rotating at the bottom)
            elif self.valid_move(self.current_piece, 0, -1):
                self.current_piece['y'] -= 1
            else:
                # Revert if no wall kick works
                self.current_piece['shape'] = old_shape
    
    def hold_piece(self):
        if not self.can_hold:
            return
            
        if self.held_piece is None:
            self.held_piece = {
                'shape': self.current_piece['shape'],
                'color': self.current_piece['color']
            }
            self.current_piece = self.next_piece
            self.next_piece = self.new_piece()
        else:
            # Swap current piece with held piece
            temp_shape = self.current_piece['shape']
            temp_color = self.current_piece['color']
            
            self.current_piece['shape'] = self.held_piece['shape']
            self.current_piece['color'] = self.held_piece['color']
            self.current_piece['x'] = GRID_WIDTH // 2 - len(self.current_piece['shape'][0]) // 2
            self.current_piece['y'] = 0
            
            self.held_piece['shape'] = temp_shape
            self.held_piece['color'] = temp_color
            
        self.can_hold = False
        
        # Check if new position is valid
        if not self.valid_move(self.current_piece):
            self.game_over = True
    
    def move(self, x_offset, y_offset):
        if self.valid_move(self.current_piece, x_offset, y_offset):
            self.current_piece['x'] += x_offset
            self.current_piece['y'] += y_offset
            return True
        return False
    
    def drop(self):
        while self.move(0, 1):
            pass
        self.lock_piece()
    
    def lock_piece(self):
        # Add piece to the grid
        for y, row in enumerate(self.current_piece['shape']):
            for x, cell in enumerate(row):
                if cell:
                    grid_y = self.current_piece['y'] + y
                    grid_x = self.current_piece['x'] + x
                    if grid_y >= 0:  # Only lock if within visible grid
                        self.grid[grid_y][grid_x] = self.current_piece['color']
        
        # Check for completed lines
        self.clear_lines()
        
        # Get next piece
        self.current_piece = self.next_piece
        self.next_piece = self.new_piece()
        self.can_hold = True
        
        # Check if game over
        if not self.valid_move(self.current_piece):
            self.game_over = True
    
    def clear_lines(self):
        lines_to_clear = []
        for y in range(GRID_HEIGHT):
            if all(self.grid[y]):
                lines_to_clear.append(y)
        
        # Add to score
        if lines_to_clear:
            self.lines_cleared += len(lines_to_clear)
            self.score += self.calculate_score(len(lines_to_clear))
            self.update_level()
            
            # Remove lines and add empty ones at top
            for y in lines_to_clear:
                del self.grid[y]
                self.grid.insert(0, [0 for _ in range(GRID_WIDTH)])
    
    def calculate_score(self, lines):
        # Standard Tetris scoring
        if lines == 1:
            return 100 * self.level
        elif lines == 2:
            return 300 * self.level
        elif lines == 3:
            return 500 * self.level
        elif lines == 4:
            return 800 * self.level
        return 0
    
    def update_level(self):
        self.level = self.lines_cleared // 10 + 1
        self.fall_speed = max(50, 500 - (self.level - 1) * 50)
    
    def get_ghost_piece(self):
        ghost = {
            'shape': self.current_piece['shape'],
            'color': GRAY,
            'x': self.current_piece['x'],
            'y': self.current_piece['y']
        }
        
        while self.valid_move(ghost, 0, 1):
            ghost['y'] += 1
        
        return ghost
    
    def draw(self):
        # Draw game area background
        pygame.draw.rect(screen, BLACK, (GAME_AREA_LEFT, 0, CELL_SIZE * GRID_WIDTH, SCREEN_HEIGHT))
        
        # Draw grid lines
        for x in range(GRID_WIDTH + 1):
            pygame.draw.line(screen, GRAY, 
                           (GAME_AREA_LEFT + x * CELL_SIZE, 0), 
                           (GAME_AREA_LEFT + x * CELL_SIZE, SCREEN_HEIGHT))
        for y in range(GRID_HEIGHT + 1):
            pygame.draw.line(screen, GRAY, 
                           (GAME_AREA_LEFT, y * CELL_SIZE), 
                           (GAME_AREA_LEFT + GRID_WIDTH * CELL_SIZE, y * CELL_SIZE))
        
        # Draw locked pieces
        for y in range(GRID_HEIGHT):
            for x in range(GRID_WIDTH):
                if self.grid[y][x]:
                    pygame.draw.rect(screen, self.grid[y][x], 
                                   (GAME_AREA_LEFT + x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE))
                    pygame.draw.rect(screen, WHITE, 
                                   (GAME_AREA_LEFT + x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE), 1)
        
        # Draw ghost piece
        if not self.game_over and not self.paused:
            ghost = self.get_ghost_piece()
            for y, row in enumerate(ghost['shape']):
                for x, cell in enumerate(row):
                    if cell:
                        rect = pygame.Rect(
                            GAME_AREA_LEFT + (ghost['x'] + x) * CELL_SIZE,
                            (ghost['y'] + y) * CELL_SIZE,
                            CELL_SIZE, CELL_SIZE
                        )
                        pygame.draw.rect(screen, ghost['color'], rect, 1)
        
        # Draw current piece
        if not self.game_over and not self.paused:
            for y, row in enumerate(self.current_piece['shape']):
                for x, cell in enumerate(row):
                    if cell:
                        rect = pygame.Rect(
                            GAME_AREA_LEFT + (self.current_piece['x'] + x) * CELL_SIZE,
                            (self.current_piece['y'] + y) * CELL_SIZE,
                            CELL_SIZE, CELL_SIZE
                        )
                        pygame.draw.rect(screen, self.current_piece['color'], rect)
                        pygame.draw.rect(screen, WHITE, rect, 1)
        
        # Draw sidebar
        sidebar_left = GAME_AREA_LEFT + GRID_WIDTH * CELL_SIZE
        pygame.draw.rect(screen, BLACK, (sidebar_left, 0, SIDEBAR_WIDTH, SCREEN_HEIGHT))
        
        # Draw next piece preview
        next_text = pygame.font.SysFont('Arial', 20).render("Next:", True, WHITE)
        screen.blit(next_text, (sidebar_left + 10, 20))
        
        next_piece_left = sidebar_left + SIDEBAR_WIDTH // 2 - len(self.next_piece['shape'][0]) * CELL_SIZE // 2
        for y, row in enumerate(self.next_piece['shape']):
            for x, cell in enumerate(row):
                if cell:
                    rect = pygame.Rect(
                        next_piece_left + x * CELL_SIZE,
                        60 + y * CELL_SIZE,
                        CELL_SIZE, CELL_SIZE
                    )
                    pygame.draw.rect(screen, self.next_piece['color'], rect)
                    pygame.draw.rect(screen, WHITE, rect, 1)
        
        # Draw held piece
        hold_text = pygame.font.SysFont('Arial', 20).render("Hold:", True, WHITE)
        screen.blit(hold_text, (sidebar_left + 10, 150))
        
        if self.held_piece:
            held_piece_left = sidebar_left + SIDEBAR_WIDTH // 2 - len(self.held_piece['shape'][0]) * CELL_SIZE // 2
            for y, row in enumerate(self.held_piece['shape']):
                for x, cell in enumerate(row):
                    if cell:
                        rect = pygame.Rect(
                            held_piece_left + x * CELL_SIZE,
                            190 + y * CELL_SIZE,
                            CELL_SIZE, CELL_SIZE
                        )
                        pygame.draw.rect(screen, self.held_piece['color'], rect)
                        pygame.draw.rect(screen, WHITE, rect, 1)
        
        # Draw score and level
        score_text = pygame.font.SysFont('Arial', 20).render(f"Score: {self.score}", True, WHITE)
        level_text = pygame.font.SysFont('Arial', 20).render(f"Level: {self.level}", True, WHITE)
        lines_text = pygame.font.SysFont('Arial', 20).render(f"Lines: {self.lines_cleared}", True, WHITE)
        
        screen.blit(score_text, (sidebar_left + 10, 280))
        screen.blit(level_text, (sidebar_left + 10, 310))
        screen.blit(lines_text, (sidebar_left + 10, 340))
        
        # Draw game over or paused message
        if self.game_over:
            game_over_font = pygame.font.SysFont('Arial', 40)
            game_over_text = game_over_font.render("GAME OVER", True, RED)
            restart_text = pygame.font.SysFont('Arial', 20).render("Press R to restart", True, WHITE)
            
            text_rect = game_over_text.get_rect(center=(SCREEN_WIDTH//2, SCREEN_HEIGHT//2 - 20))
            restart_rect = restart_text.get_rect(center=(SCREEN_WIDTH//2, SCREEN_HEIGHT//2 + 20))
            
            screen.blit(game_over_text, text_rect)
            screen.blit(restart_text, restart_rect)
        elif self.paused:
            pause_font = pygame.font.SysFont('Arial', 40)
            pause_text = pause_font.render("PAUSED", True, WHITE)
            text_rect = pause_text.get_rect(center=(SCREEN_WIDTH//2, SCREEN_HEIGHT//2))
            screen.blit(pause_text, text_rect)

def main():
    game = Tetris()
    running = True
    
    while running:
        current_time = pygame.time.get_ticks()
        
        # Handle events
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
            
            if not game.game_over and not game.paused:
                if event.type == pygame.KEYDOWN:
                    if event.key == pygame.K_LEFT:
                        game.move(-1, 0)
                    elif event.key == pygame.K_RIGHT:
                        game.move(1, 0)
                    elif event.key == pygame.K_DOWN:
                        game.move(0, 1)
                    elif event.key == pygame.K_UP:
                        game.rotate_piece()
                    elif event.key == pygame.K_SPACE:
                        game.drop()
                    elif event.key == pygame.K_c:
                        game.hold_piece()
            
            # Global controls (work even when paused or game over)
            if event.type == pygame.KEYDOWN:
                if event.key == pygame.K_p:
                    game.paused = not game.paused
                elif event.key == pygame.K_r and game.game_over:
                    game = Tetris()  # Reset game
        
        # Game logic
        if not game.game_over and not game.paused:
            if current_time - game.last_fall_time > game.fall_speed:
                if not game.move(0, 1):
                    game.lock_piece()
                game.last_fall_time = current_time
        
        # Drawing
        screen.fill(BLACK)
        game.draw()
        pygame.display.flip()
        
        # Cap the frame rate
        clock.tick(60)
    
    pygame.quit()

if __name__ == "__main__":
    main()
