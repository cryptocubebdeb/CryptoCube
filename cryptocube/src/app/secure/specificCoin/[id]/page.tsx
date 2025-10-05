import Image from "next/image";
import { getCoin } from '../../../lib/getCoin';
import { Geologica } from "next/font/google"


const geologica = Geologica({
    subsets: ["latin"],
    weight: ["400", "700"],
})

export default async function Page({ params }: { params: { id: string } }) {

    const { id } = await params;
    const coinData = await getCoin(id);

    const name = coinData?.name ?? id;
    const logo = coinData?.image?.large as string | undefined;
    const symbole = coinData?.symbol ?? id;

    return (
        <>
            <div className={`h-screen flex flex-col ${geologica.className}`}>
                <div className="flex flex-col flex-1 items-center">
                    <h1 className="w-full text-3xl font-mono mb-9 mt-12">{name}</h1>
                    <div className="w-[85%]">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4 p-4">
                                {logo && (
                                    <Image
                                        src={logo}
                                        alt={`${name} logo`}
                                        width={48}
                                        height={48}
                                        className="rounded"
                                        priority
                                    />
                                )}
                                <div className="flex items-baseline gap-2">
                                    <h1 className="text-3xl">{name}</h1>
                                    <span className="text-xl text-white/70">{symbole}</span>
                                </div>
                            </div>
                            <button className="bg-[#3B455E] hover:bg-[#15171E] text-white py-2 px-3 rounded">
                                Modify in portfolio
                            </button>
                        </div>
                        <div className="w-full mx-auto bg-[#15171E] text-white p-8 rounded-[2px] shadow-md">
                            {/* your content here */}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}