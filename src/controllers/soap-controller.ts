import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { Request, Response } from "express";

import { AuthRequest } from "../middlewares/authentication-middleware";
import { soapConfig } from "../config/soap-config";
import axios from 'axios';
import xml2js from 'xml2js';

interface SubscriptionRequest {
    creatorID: number;
    subscriberID: number;
}

export class SoapController {
    accept() {
        return async (req: Request, res: Response) => {
            const { token } = req as AuthRequest;
            if (!token || !token.isAdmin) {
                // Endpoint hanya bisa diakses oleh admin
                res.status(StatusCodes.UNAUTHORIZED).json({
                    message: ReasonPhrases.UNAUTHORIZED,
                });
                return;
            }

            // Parse request body
            const { creatorID, subscriberID }: SubscriptionRequest =
                req.body;

            try {
                await axios.post(
                `http://${soapConfig.host}:${soapConfig.port}/api/subscribe`,
                `<Envelope xmlns="http://schemas.xmlsoap.org/soap/envelope/">
                    <Body>
                        <approveSubscribe xmlns="http://service.binotify/">
                            <arg0 xmlns="">${creatorID}</arg0>
                            <arg1 xmlns="">${subscriberID}</arg1>
                        </approveSubscribe>
                    </Body>
                </Envelope>`,
                {
                    headers: {
                        "Content-Type": "text/xml",
                    },
                })
                .then((response) => {
                    xml2js.parseString(response.data, (err, result) => {
                        var datas = result['S:Envelope']['S:Body'][0]['ns2:approveSubscribeResponse'][0].return[0];
                        if (datas == "Subscription not found") {
                            res.status(StatusCodes.NOT_FOUND).json({
                                message: datas,
                            });
                        }
                        else if (datas == "Subscription accepted") {
                            res.status(StatusCodes.OK).json({
                                message: datas,
                            });
                        }
                        else {
                            res.status(StatusCodes.BAD_REQUEST).json({
                                message: datas,
                            });
                        }
                    });
                });  
            } catch (error) {
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                    message: ReasonPhrases.INTERNAL_SERVER_ERROR,
                });
            }
        };
    }

    reject() {
        return async (req: Request, res: Response) => {
            const { token } = req as AuthRequest;
            if (!token || !token.isAdmin) {
                // Endpoint hanya bisa diakses oleh admin
                res.status(StatusCodes.UNAUTHORIZED).json({
                    message: ReasonPhrases.UNAUTHORIZED,
                });
                return;
            }

            // Parse request body
            const { creatorID, subscriberID }: SubscriptionRequest =
                req.body;

            try {
                await axios.post(
                `http://${soapConfig.host}:${soapConfig.port}/api/subscribe`,
                `<Envelope xmlns="http://schemas.xmlsoap.org/soap/envelope/">
                    <Body>
                        <rejectSubscribe xmlns="http://service.binotify/">
                            <arg0 xmlns="">${creatorID}</arg0>
                            <arg1 xmlns="">${subscriberID}</arg1>
                        </rejectSubscribe>
                    </Body>
                </Envelope>`,
                {
                    headers: {
                        "Content-Type": "text/xml",
                    },
                }).then((response) => {
                    xml2js.parseString(response.data, (err, result) => {
                        var datas = result['S:Envelope']['S:Body'][0]['ns2:rejectSubscribeResponse'][0].return[0];
                        if (datas == "Subscription not found") {
                            res.status(StatusCodes.NOT_FOUND).json({
                                message: datas,
                            });
                        }
                        else if (datas == "Subscription rejected") {
                            res.status(StatusCodes.OK).json({
                                message: datas,
                            });
                        }
                        else {
                            res.status(StatusCodes.BAD_REQUEST).json({
                                message: datas,
                            });
                        }
                    });
                });  
            } catch (error) {
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                    message: ReasonPhrases.INTERNAL_SERVER_ERROR,
                });
            }
        };
    }

    index() {
        return async (req: Request, res: Response) => {
            const { token } = req as AuthRequest;
            if (!token || !token.isAdmin) {
                // Endpoint hanya bisa diakses oleh admin
                res.status(StatusCodes.UNAUTHORIZED).json({
                    message: ReasonPhrases.UNAUTHORIZED,
                });
                return;
            }
            
            const page = parseInt((req.query?.page || "1") as string);
            const pageSize = parseInt((req.query?.pageSize || "5") as string);
            let subscriptionData: SubscriptionRequest[] = [];
            try {
                await axios.post(
                `http://${soapConfig.host}:${soapConfig.port}/api/subscribe`,
                `<Envelope xmlns="http://schemas.xmlsoap.org/soap/envelope/">
                    <Body>
                        <getAllReqSubscribe xmlns="http://service.binotify/">
                            <arg0 xmlns="">${page}</arg0>
                            <arg1 xmlns="">${pageSize}</arg1>
                        </getAllReqSubscribe>
                    </Body>
                </Envelope>`,
                {
                    headers: {
                        "Content-Type": "text/xml",
                    },
                }
                ).then((response) => {
                    xml2js.parseString(response.data, (err, result) => {
                        var datas = result['S:Envelope']['S:Body'][0]['ns2:getAllReqSubscribeResponse'][0].return[0].data;
                        datas.forEach((element: any) => {
                            subscriptionData.push({
                                creatorID: element.creator[0],
                                subscriberID: element.subscriber[0],
                            });
                        });
                        var pageCount = result['S:Envelope']['S:Body'][0]['ns2:getAllReqSubscribeResponse'][0].return[0].pageCount[0];
                        res.status(StatusCodes.OK).json({
                            message: ReasonPhrases.OK,
                            data: subscriptionData,
                            totalPage: pageCount,
                        });
                    }); 
                });
            } catch (error) {
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                    message: ReasonPhrases.INTERNAL_SERVER_ERROR,
                });
            }
        };
    }
}
