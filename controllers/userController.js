// userController.js
const redisClient = require('../redisClient'); // Adjust path based on your structure
const { User } = require('../models'); // Adjust path based on your structure

module.exports = {
  create: async (req, res) => {
    try {
      const { username, email, password } = req.body;

      // Validate the input
      if (!username || !password) {
        return res.status(400).json({ error: 'Name, email, and password are required' });
      }

      // Create a new user
      const user = await User.create({ username, email, password });

      // Optionally clear any relevant caches here if needed

      return res.status(201).json({
        message: 'User created successfully',
        user: {
          id: user.id,
          name: user.username,
          email: user.email,
        },
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'An error occurred while creating the user' });
    }
  },

  delete: async (req, res) => {
    const { id } = req.params;
    try {
      // Delete user
      const result = await User.destroy({
        where: { id: id },
      });

      if (result === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Remove user from cache
      await redisClient.del(`user:${id}`);

      return res.status(204).send();
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'An error occurred while deleting the user' });
    }
  },

  read: async (req, res) => {
    try {
        const client = await redisClient.ensureRedisConnection();
        const { id } = req.params;

        // Check if user data is in the cache
        let user = await client.get(`user:${id}`);
        console.log(user);
        
        if (user) {
            return res.json(JSON.parse(user));
        }

        // Fetch user from database if not in cache
        user = await User.findOne({ where: { id: id } });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Store user in cache
        await client.setEx(`user:${id}`, 3600, JSON.stringify(user));

        return res.json(user);
    } catch (error) {
        console.error('Error in read method:', error);
        res.status(500).send('Internal Server Error');
    }
}
,
  

  update: async (req, res) => {
    const { username, email, password } = req.body;
    const { id } = req.params;

    try {
      const [updated] = await User.update(
        { username, email, password },
        { where: { id: id }, returning: true }
      );

      if (updated === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Invalidate and update the cache
      await redisClient.del(`user:${id}`);

      // Fetch the updated user
      const updatedUser = await User.findOne({ where: { id: id } });

      // Store the updated user in cache
      await redisClient.setEx(`user:${id}`, 3600, JSON.stringify(updatedUser));

      return res.status(200).json({
        message: 'User updated successfully',
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'An error occurred while updating the user' });
    }
  }
};
