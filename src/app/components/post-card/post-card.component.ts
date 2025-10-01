import { Component, input } from '@angular/core';
import { Post } from '../../models/post.model';

@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [],
  templateUrl: './post-card.component.html',
  styleUrl: './post-card.component.scss',
})
export class PostCardComponent {
  post = input.required<Post>();
}
