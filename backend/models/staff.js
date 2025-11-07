const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
      staff_id: {
        type: String,
        required: true,
      },
      centre_id: {
        type: String,
        required: true,
      },
      vaccine_list: [
        {
          centre_vaccine_id: {
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
// assign vaccines on staff
// update stuff vaccine list (RBAC) (body : centre vaccine id list)



// stuff:
// get stuff vaccine list 
// create stuff vaccine log (given center vaccine id, date, dosed_used, wasted)

//staff: centre:
// get stuff efficiency (given stuff id) (return for each centre vaccine that this stuff gives (total dosed given by this stuff, total dosed wasted by this stuff), total people serve by this staff (get people from vaccine_log modal))


