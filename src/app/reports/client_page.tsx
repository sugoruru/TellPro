"use client";
import returnRandomString from "@/modules/algo/returnRandomString";
import { DBUsersExistMe } from "@/types/axiosTypes";
import { User, Report } from "@/types/DBTypes";
import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";

const Reports = () => {
  const [user, setUser] = useState<User | null>(null);
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    const fetcher = async () => {
      const data = await axios.get<DBUsersExistMe>(`/api/db/users/existMe`);
      if (!data.data.ok) return;
      setUser(data.data.data);
      if (data.data.data.is_admin) {
        const reports = await axios.post<{ data: Report[] }>(`/api/admin/get_report`);
        setReports(reports.data.data);
      }
    };
    fetcher();
  }, []);

  return (
    <div className="h-full">
      {!user ? (
        <div className={`text-black dark:text-white`}>ロード中</div>
      ) : user.is_admin ? (
        <div className={`text-black dark:text-white`}>
          <div className="flex justify-center">
            <table>
              <thead>
                <tr className="text-black">
                  <th>user_id</th>
                  <th>reported_user_id</th>
                  <th>report_value</th>
                  <th>created_at</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={returnRandomString(64)}>
                    <th>
                      <Link className="underline text-blue-600 hover:text-blue-800 visited:text-purple-600" href={`/${report.user_id}`}>
                        {report.user_id}
                      </Link>
                    </th>
                    <td>
                      <Link className="underline text-blue-600 hover:text-blue-800 visited:text-purple-600" href={`/${report.reported_user_id}`}>
                        {report.reported_user_id}
                      </Link>
                    </td>
                    <td>{report.report_value}</td>
                    <td>{report.created_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className={`text-black dark:text-white`}>Admin以外は閲覧できません</div>
      )}
    </div>
  );
};

export default Reports;
