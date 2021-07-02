const mongoose = require('mongoose')

const StorySchema = mongoose.Schema({
    author: String,
    title: String,
    body: String,
    is_draft: {
        type: Boolean,
        default: true
    }
})

const Story = mongoose.model('Story', StorySchema)

module.exports = Story