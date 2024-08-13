/* eslint-disable @next/next/no-img-element */
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"

const CardCar = ({plate,car,image}:{plate:any,car:any,image:any}) => {
  return (
    <div>
         {/* card */}
         <Card className="w-[350px] ml-9 h-full">
              <CardHeader>
                <CardTitle>Available Cars</CardTitle>
                <CardDescription>List of all cars available.</CardDescription>
              </CardHeader>
              <CardContent>
              <img src={image} alt="Car Image" />
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className='flex gap-[100px] justify-between'>
                    <h6>{plate}</h6>
                    <h6>{car}</h6>
                </div>
              </CardFooter>
            </Card>
      
    </div>
  )
}

export default CardCar
