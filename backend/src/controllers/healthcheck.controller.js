import asyncHandler from 'express-async-handler'

const handleHealthcheck = asyncHandler(async (req, res) => {
  return res.send({
    message: "OK Report"
  })
})

export {
  handleHealthcheck
}