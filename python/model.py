import pygame
import random

# Initialize pygame
pygame.init()

# Set up display
WIDTH, HEIGHT = 600, 400
CELL_SIZE = 20
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("Snake Game")

# Colors
WHITE = (255, 255, 255)
GREEN = (0, 255, 0)
RED = (255, 0, 0)
BLACK = (0, 0, 0)

# Snake and food setup
snake = [(100, 100), (90, 100), (80, 100)]  # Initial snake position
snake_dir = (CELL_SIZE, 0)  # Initial direction (moving right)
food = (random.randint(0, (WIDTH // CELL_SIZE) - 1) * CELL_SIZE,
        random.randint(0, (HEIGHT // CELL_SIZE) - 1) * CELL_SIZE)

clock = pygame.time.Clock()
running = True

while running:
    screen.fill(BLACK)
    
    # Event handling
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
        elif event.type == pygame.KEYDOWN:
            if event.key == pygame.K_UP and snake_dir != (0, CELL_SIZE):
                snake_dir = (0, -CELL_SIZE)
            elif event.key == pygame.K_DOWN and snake_dir != (0, -CELL_SIZE):
                snake_dir = (0, CELL_SIZE)
            elif event.key == pygame.K_LEFT and snake_dir != (CELL_SIZE, 0):
                snake_dir = (-CELL_SIZE, 0)
            elif event.key == pygame.K_RIGHT and snake_dir != (-CELL_SIZE, 0):
                snake_dir = (CELL_SIZE, 0)
    
    # Move the snake
    new_head = (snake[0][0] + snake_dir[0], snake[0][1] + snake_dir[1])
    
    # Collision detection (wall or self)
    if (new_head in snake or
        new_head[0] < 0 or new_head[1] < 0 or
        new_head[0] >= WIDTH or new_head[1] >= HEIGHT):
        running = False
    
    # Add new head to snake
    snake.insert(0, new_head)
    
    # Check if snake eats food
    if new_head == food:
        food = (random.randint(0, (WIDTH // CELL_SIZE) - 1) * CELL_SIZE,
                random.randint(0, (HEIGHT // CELL_SIZE) - 1) * CELL_SIZE)
    else:
        snake.pop()
    
    # Draw food
    pygame.draw.rect(screen, RED, (food[0], food[1], CELL_SIZE, CELL_SIZE))
    
    # Draw snake
    for segment in snake:
        pygame.draw.rect(screen, GREEN, (segment[0], segment[1], CELL_SIZE, CELL_SIZE))
    
    pygame.display.flip()
    clock.tick(10)  # Control snake speed

pygame.quit()