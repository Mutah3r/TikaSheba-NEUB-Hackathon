const mongoose = require('mongoose');



const staffSchema = new mongoose.Schema({
      id: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      password: {
        type: String,
        required: true,
      },
      vaccine_list: [
        {
          center_vaccine_id: {
            type: String,
            required: true,
          },
          vaccine_name: {
            type: String,
            required: true,
          },
          log : [
            {
                date: {
                        type: Date,
                        required: true,
                },
                dose_used: {
                        type : Number,
                        default : 0,
                },
                dose_wasted: {
                        type : Number,
                        default: 0,
                }
            }
          ]
        },
      ],
   
});

const staff = mongoose.model('staff', staffSchema);
module.exports = staff;




// vaccine center:
// add stuff or create stuff
// update stuff vaccine list (RBAC) (body : center vaccine id list)



// stuff:
// get stuff vaccine list 
// create stuff vaccine log (given center vaccine id, date, dosed_used, wasted)
// get stuff efficiency (given stuff id) (return for each center vaccine that this stuff gives (total dosed given by this stuff, total dosed wasted by this stuff), total people serve by this employee (get people from vaccine_log modal))


