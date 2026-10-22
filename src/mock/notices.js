export function buildNotices(db, me) {
  const notices = [];
  const readIds = new Set(me.state.readNoticeIds || []);
  const accounts = new Map(db.accounts.map((account) => [account.id, account]));
  const posts = new Map(
    db.entities.filter((entity) => entity.kind === 'post').map((post) => [post.id, post]),
  );
  const comments = new Map(db.comments.map((comment) => [comment.id, comment]));
  const name = (id) => accounts.get(id)?.profile.name || '회원';
  const add = (notice) => notices.push({ ...notice, read: readIds.has(notice.id) });

  for (const comment of db.comments) {
    if (comment.author === me.id) continue;
    const post = posts.get(comment.postId);
    if (!post) continue;
    const target = comments.get(comment.replyTo || comment.parent);
    const replyToMe = target?.author === me.id;
    if (post.owner !== me.id && !replyToMe) continue;
    add({
      id: `comment:${comment.id}`,
      type: replyToMe ? 'reply' : 'comment',
      text: `${name(comment.author)}님이 ${replyToMe ? '내 댓글에 답글을' : '내 게시글에 댓글을'} 남겼습니다.`,
      sub: `${post.payload.title} · ${comment.text.slice(0, 100)}`,
      route: `#post/${post.id}`,
      order: comment.id,
      created: comment.created || '',
    });
  }
  for (const message of db.messages) {
    if (message.receiver !== me.id) continue;
    const sender = accounts.get(message.sender);
    if (!sender) continue;
    add({
      id: `message:${message.id}`,
      type: 'message',
      text: `${sender.profile.name}님이 새 메시지를 보냈습니다.`,
      sub: message.text.slice(0, 100),
      peerId: sender.memberId,
      route: '#home',
      order: message.id,
      created: message.created,
    });
  }
  for (const connection of db.connections) {
    const id = connection.id || connection.key;
    if (connection.receiver === me.id && connection.status === 'pending') {
      add({
        id: `connection:${id}`,
        type: 'connection',
        text: `${name(connection.sender)}님이 동료 요청을 보냈습니다.`,
        sub: '동료 요청',
        route: '#members',
        order: connection.id || 0,
        created: connection.created || '',
      });
    }
    if (connection.sender === me.id && connection.status === 'accepted') {
      add({
        id: `connection-accepted:${id}`,
        type: 'connection',
        text: `${name(connection.receiver)}님이 동료 요청을 수락했습니다.`,
        sub: '새 동료와 대화를 시작해 보세요.',
        route: '#members',
        order: connection.acceptedOrder || connection.id || 0,
        created: connection.acceptedAt || '',
      });
    }
  }
  return notices.sort((a, b) => b.order - a.order);
}
