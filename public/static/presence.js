(async function() {
  try {
    const res = await fetch('/api/config');
    const config = await res.json();
    if (!config.supabaseUrl || !config.supabaseKey) return;

    // Supabase is loaded from CDN
    const { createClient } = window.supabase;
    const client = createClient(config.supabaseUrl, config.supabaseKey);

    const user = config.user;
    if (!user) return; // Only track logged in users for now

    const room = client.channel('online-users', {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    room.on('presence', { event: 'sync' }, () => {
      const state = room.presenceState();
      const onlineUsers = [];
      for (const id in state) {
        onlineUsers.push(state[id][0]);
      }
      // Broadcast to window for dashboard
      window.__ONLINE_USERS = onlineUsers;
      const evt = new CustomEvent('onlineUsersSync', { detail: onlineUsers });
      window.dispatchEvent(evt);
    });

    room.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await room.track({
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
          online_at: new Date().toISOString(),
        });
      }
    });

  } catch (err) {
    console.error('Failed to init presence:', err);
  }
})();
