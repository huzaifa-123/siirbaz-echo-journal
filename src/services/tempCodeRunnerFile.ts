async likePost(postId: number) {
    return this.request('/like', {
      method: 'POST',
      body: JSON.stringify({ postId }),
    });
  }