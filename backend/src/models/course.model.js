import mongoose from "mongoose"

const courseSchema= new  mongoose.Schema({

coursename:{
    type:String,
    require:true
},

description: {
    type: String,
    required: true
},

thumbnail: {
    type: String, // URL or path to the thumbnail image
    default: null
},

price: {
    type: Number,
    required: true,
    default: 0
},

sections: [{
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    videos: [{
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            default: ''
        },
        videoUrl: {
            type: String,
            required: true
        },
        duration: {
            type: Number, // Duration in seconds
            default: 0
        },
        order: {
            type: Number,
            default: 0
        }
    }],
    order: {
        type: Number,
        default: 0
    }
}],

isapproved: {
    type: Boolean,
    default: false
},

liveClasses: [{
    title: String,
    timing: Number,
    date:Date,
    link: String,
    status: {
        type: String,
        enum: ['upcoming', 'in-progress', 'completed'],
        default: 'upcoming'
      }
  }],

enrolledteacher:{
    type:mongoose.Schema.Types.ObjectId,
    ref: "teacher",
    require:true
},

enrolledStudent: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'student' 
  }],

schedule: [{
    day: {
        type: Number,
        enum: [0, 1, 2, 3, 4, 5, 6]
    },
    starttime: {
        type: Number,
        min: 0,
        max: 24 * 60 
    },
    endtime: {
        type: Number,
        min: 0,
        max: 24 * 60 
    }
}],



},{timestamps:true})

const course= mongoose.model('course',courseSchema)

export {course}