
const {validator}= require('../../../models/checklist');

describe("validateChecklist",()=>{

    it("should return an object with an error if invalid object passed",()=>{
        const object = validator({bla: "bla"});
        expect(object.error).not.toBeNull()
    })

})