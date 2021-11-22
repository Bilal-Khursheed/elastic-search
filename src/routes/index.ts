import { Router, Request, Response } from 'express';
import { getAllUsers, addOneUser, updateOneUser, deleteOneUser } from './Users';
import { Client, ApiResponse } from '@elastic/elasticsearch';

//elastic search 
const elasticSearch = new Client({
    node: 'http://localhost:9200'
});

let productos = [
    {
        id: 1,
        name: "ali",
        age: 23,
        categories: ['student', 'worker', 'searching-for-job', 'business-man'],
        description: "I am an optimistic, candid, responsible and social person. I am confident with my thinking analysis that I can convince people with my points. I am self-reliant, well behaved and above all, a person of strong character. I take initiative whenever the situation arises and come off with flying colours"
    },
    {
        id: 2,
        name: "Ammar",
        age: 26,
        categories: ['student', 'worker', 'searching-for-job', 'business-man'],
        description: "I am passionate about my work. Because I love what I do, I have a steady source of motivation that drives me to do my best. In my last job, this passion led me to challenge myself daily and learn new skills that helped me to do better work"
    }, {
        id: 3,
        name: "jalal",
        age: 21,
        categories: ['student', 'worker', 'searching-for-job', 'business-man'],
        description: "Emphasize your personality traits. Be strict on what you've got to write, don't contradict your self-description during the personal interview. Mention your positive personal traits like enthusiasm, hardworking, diligence. Talk briefly about where you grew up and your family."

    }, {
        id: 4,
        name: "Bilal",
        age: 25,
        categories: ['student', 'worker', 'searching-for-job', 'business-man'],
        description: "I am ambitious and driven. I thrive on challenge and constantly set goals for myself, so I have something to strive towards. I'm not comfortable with settling, and I'm always looking for an opportunity to do better and achieve greatness. In my previous role, I was promoted three times in less than two years."

    },
]

// // User-route
// const userRouter = Router();
// userRouter.get('/all', getAllUsers);
// userRouter.post('/add', addOneUser);
// userRouter.put('/update', updateOneUser);
// userRouter.delete('/delete/:id', deleteOneUser);


// Export the base-router
const baseRouter = Router();
baseRouter.use((req, res, next) => {
    elasticSearch.index({
        index: 'logs',
        body: {
            url: req.url,
            method: req.method
        }
    }).then((res: ApiResponse) => {
        console.log('log indexed', res)
    }).catch((err: Error) => {
        console.error('Error', err)
    })
    next()
});
baseRouter.post('/products', (req: Request, res: Response) => {
    elasticSearch.index({
        index: 'products',
        body: req.body
    }).then((resp: ApiResponse) => {
        console.log('index Added...', resp);
        res.status(200).json({
            message: 'index Added.',
            data: res
        })
    }).catch((err: Error) => {
        console.error('Error', err);
        return res.status(404).json({
            message: 'Error',
            product: err
        });
    })
});
baseRouter.get('/products/:id', (req: Request, res: Response) => {

    elasticSearch.get({
        index: 'products',
        id: req.params.id
    }).then((resp: ApiResponse) => {
        if (!resp) {
            return res.status(404).json({
                message: 'Not Found...',
                product: resp
            });
        }
        return res.status(200).json({
            message: 'Success',
            produts: resp
        })
    }).catch((err: Error) => {
        console.error('Error', err);
        return res.status(404).json({
            message: 'Error',
            product: err
        });
    })
});
baseRouter.get('/products', (req: Request, res: Response) => {
    var context: any = {
        index: 'products'
    };
    if (req.query.product) {
        context.q = `*${req.query.product}*`
    }
    elasticSearch.search(context).then((resp: ApiResponse) => {
        if (!resp) {
            return res.status(404).json({
                message: 'Not Found...',
                product: resp
            });
        }
        let { body: {
            hits: { hits }
        } } = resp
        return res.status(200).json({
            message: 'Success',
            produts: hits
        })
    }).catch((err: Error) => {
        console.error('Error', err);
        return res.status(404).json({
            message: 'Error',
            product: err
        });
    })
})
export default baseRouter;
