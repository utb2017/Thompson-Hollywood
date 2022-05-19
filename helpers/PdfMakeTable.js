import pdfMake from 'pdfmake/build/pdfmake';
import vfsFonts from 'pdfmake/build/vfs_fonts';
import { isCurr } from '.';
import { fakeData } from './FakeData';
import { realData } from './RealData';

const toMoney = (x) => {
    let y = parseFloat(x) || `-- --`;
    if (y && parseFloat(y) === y) {
        y = y.toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
        });
    }
    return y;
};

const _format = (data) => {
    return data.map(item => {
        return ([
            { text: item.name },
            { text: item.username },
            { text: item.email },
            { text: item.phone },
            { text: item.website },
        ]);
    });
}

const __format = (data) => {



    return data.map(item => {
        //alert(`${JSON.stringify(item)}`)

        const obj = item;
        for (const [key, value] of Object.entries(obj)) {
            // if(key === 'orderIds'){
            //     return           
            // }
            if (key === 'id') {
                //const text = key;
                //const result = text.replace(/([A-Z])/g, " $1");
                const finalResult = 'Date / Range'
                return ([
                    { text: finalResult },
                    { text: value },
                ]);
            }
            if (key === 'total' || key === "productsSold" || key === "creditsApplied" || key === "discountsApplied") {
                const text = key;
                const result = text.replace(/([A-Z])/g, " $1");
                const finalResult = result.charAt(0).toUpperCase() + result.slice(1);
                return ([
                    { text: finalResult },
                    { text: value },
                ]);
            }
            if (
                key === 'taxableSubtotal'
                || key === 'wholesale'
                || key === 'proft'
                || key === 'totalSaved'
                || key === 'grandTotal'
                || key === 'creditTotal'
                || key === 'localTax'
                || key === 'taxTotal'
                || key === 'deliveryTotal'
                || key === 'discountTotal'
                || key === 'productsTotal'
                || key === 'serviceFee'
                || key === 'exciseTax'
                || key === 'subtotal'
                || key === 'stateTax'
            ) {
                const text = key;
                const result = text.replace(/([A-Z])/g, " $1");
                const finalResult = result.charAt(0).toUpperCase() + result.slice(1);
                return ([
                    { text: finalResult },
                    { text: isCurr(value / 100) },
                ]);
            }

            return ([
                { text: key },
                { text: value },
            ]);
        }

    });
}




export const pdfMakeTable = (rows, fireData) => {
    const { vfs } = vfsFonts.pdfMake;
    pdfMake.vfs = vfs;

    const data = fakeData(rows);
    const _data = realData(rows, fireData);


    // alert(` fake data ${JSON.stringify(data)}`)
    // alert(` real data ${JSON.stringify(_data)}`)


    const formattedData = _format(data);
    const formattedTotals = __format(_data);


    //alert(` fake data ${JSON.stringify(formattedData)}`)
    //alert(` real data ${JSON.stringify(formattedTotals)}`) 

    const documentDefinition = {
        pageSize: 'A4',
        pageOrientation: 'portrait',
        content: [
            { text: 'Totals' },
            '\n',
            {
                table: {
                    //headerRows: 1,
                    dontBreakRows: false,
                    body: [
                        [
                            { text: 'Date' },
                            { text: `${fireData?.data?.id}`},
                        ],
                        [
                            { text: 'Products Total' },
                            { text: `${isCurr(fireData?.data?.productsTotal/100)}`},
                        ],
                        [
                            { text: 'Products Sold' },
                            { text: `${fireData?.data?.productsSold}`},
                        ],
                        [
                            { text: 'Cost' },
                            { text: `${isCurr(fireData?.data?.wholesale/100)}`},
                        ],
                        [
                            { text: 'Subtotal' },
                            { text: `${isCurr(fireData?.data?.subtotal/100)}`},
                        ],
                        [
                            { text: 'Taxable Subtotal' },
                            { text: `${isCurr(fireData?.data?.taxableSubtotal/100)}`},
                        ],
                        [
                            { text: 'State Tax Collected' },
                            { text: `${isCurr(fireData?.data?.stateTax/100)}`},
                        ],
                        [
                            { text: 'Excise Tax Collected' },
                            { text: `${isCurr(fireData?.data?.exciseTax/100)}`},
                        ],
                        [
                            { text: 'Local Tax Collected' },
                            { text: `${isCurr(fireData?.data?.localTax/100)}`},
                        ],
                        [
                            { text: 'Total Tax Collected' },
                            { text: `${isCurr(fireData?.data?.taxTotal/100)}`},
                        ],
                        [
                            { text: "Service Fee's Collected" },
                            { text: `${isCurr(fireData?.data?.serviceFee/100)}`},
                        ],
                        [
                            { text: `Delivery Fee's Collected` },
                            { text: `${isCurr(fireData?.data?.deliveryTotal/100)}`},
                        ],
                        [
                            { text: 'Discounts Given' },
                            { text: `${fireData?.data?.discountsApplied}`},
                        ],
                        [
                            { text: 'Discounts Total' },
                            { text: `${isCurr(fireData?.data?.discountTotal/100)}`},
                        ],
                        [
                            { text: 'Credits Given' },
                            { text: `${fireData?.data?.creditsApplied}`},
                        ],
                        [
                            { text: 'Credits Total' },
                            { text: `${isCurr(fireData?.data?.creditTotal/100)}`},
                        ],
                        [
                            { text: 'Total Lost' },
                            { text: `${isCurr(fireData?.data?.totalSaved/100)}`},
                        ],
                        [
                            { text: 'Total Collected' },
                            { text: `${isCurr(fireData?.data?.grandTotal/100)}`},
                        ],
                        //...formattedTotals,
                    ]
                }
            }
        ]
    };

    pdfMake.createPdf(documentDefinition).open();
}